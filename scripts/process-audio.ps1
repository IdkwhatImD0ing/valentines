# Voice Audio Processing Script
# Processes recording.m4a with voice enhancement, then mixes with piano backing track

$voiceInput = "recording.m4a"
$pianoInput = "riverflowsinyou.m4a"
$outputFile = "public/audio/letter.mp3"
$tempVoice = "public/audio/_temp_voice.mp3"

# Check if input files exist
if (-not (Test-Path $voiceInput)) {
    Write-Error "Voice file '$voiceInput' not found!"
    exit 1
}
if (-not (Test-Path $pianoInput)) {
    Write-Error "Piano file '$pianoInput' not found!"
    exit 1
}

# ── Step 1: Process the voiceover ──
Write-Host "=== Step 1: Processing voiceover ===" -ForegroundColor Cyan
Write-Host "  - High-pass filter (80Hz)"
Write-Host "  - Compression (even dynamics)"
Write-Host "  - EQ boost at 3kHz (presence)"
Write-Host "  - EQ cut at 300Hz (reduce mud)"
Write-Host "  - Loudness normalization (-16 LUFS)"
Write-Host "  - Limiter (prevent clipping)"
Write-Host ""

$voiceFilters = @(
    "highpass=f=80",
    "acompressor=threshold=-20dB:ratio=3:attack=5:release=100:makeup=2",
    "equalizer=f=3000:t=q:w=1:g=3",
    "equalizer=f=300:t=q:w=1:g=-2",
    "loudnorm=I=-16:TP=-1.5:LRA=11",
    "alimiter=limit=0.95:level=false"
) -join ","

& ffmpeg -y -i $voiceInput -af $voiceFilters -b:a 192k -ar 44100 $tempVoice

if ($LASTEXITCODE -ne 0) {
    Write-Error "Voice processing failed!"
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Voiceover processed." -ForegroundColor Green
Write-Host ""

# ── Step 2: Get the voiceover duration so we can trim the piano to match ──
$durationOutput = & ffprobe -v error -show_entries format=duration -of csv=p=0 $tempVoice
$voiceDuration = [double]$durationOutput.Trim()
Write-Host "Voiceover duration: $([math]::Round($voiceDuration, 1))s" -ForegroundColor Cyan
Write-Host ""

# ── Step 3: Mix piano backing with voiceover ──
Write-Host "=== Step 2: Mixing with piano backing ===" -ForegroundColor Cyan
Write-Host "  - Trimming first 1s from piano"
Write-Host "  - Lowering piano volume to -18dB (sits under voice)"
Write-Host "  - Fading piano to match voiceover length"
Write-Host "  - Adding 3s fade-out at the end"
Write-Host ""

# Filter explanation:
# [0:a] = processed voice
# [1:a] = piano, trimmed (skip 1s), lowered volume, trimmed to voice duration + 3s for fade, fade out at end
# amix = combine both streams

$fadeStart = [math]::Round($voiceDuration - 3, 2)
$pianoLength = [math]::Round($voiceDuration + 3, 2)

$complexFilter = "[1:a]atrim=start=1,asetpts=PTS-STARTPTS,volume=0.20,afade=t=in:d=2,atrim=0:$pianoLength,asetpts=PTS-STARTPTS,afade=t=out:st=$fadeStart`:d=3[piano];[0:a][piano]amix=inputs=2:duration=longest:dropout_transition=3,alimiter=limit=0.95:level=false[out]"

& ffmpeg -y -i $tempVoice -i $pianoInput -filter_complex $complexFilter -map "[out]" -b:a 192k -ar 44100 $outputFile

if ($LASTEXITCODE -ne 0) {
    Write-Error "Mixing failed!"
    # Clean up temp file
    Remove-Item -Path $tempVoice -ErrorAction SilentlyContinue
    exit $LASTEXITCODE
}

# Clean up temp file
Remove-Item -Path $tempVoice -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "=== Complete! ===" -ForegroundColor Green
Write-Host "Output saved to: $outputFile" -ForegroundColor Green
Write-Host "Piano backing: trimmed 1s, lowered volume, faded out at end" -ForegroundColor Green
