import json
import subprocess
import sys
from pathlib import Path

# Find the VoltGrid project folder
project_dir = Path(__file__).resolve().parent.parent

# Path to the training script
training_script = project_dir / "backend" / "train_model.py"

print("Starting VoltGrid local training pipeline...")
print(f"Project folder: {project_dir}")

# Check that the training script exists
if not training_script.exists():
    print(f"ERROR: Training script not found: {training_script}")
    sys.exit(1)

# Run the model training script
result = subprocess.run(
    [sys.executable, str(training_script)],
    cwd=project_dir,
    capture_output=True,
    text=True
)

# Display training output
if result.stdout:
    print(result.stdout)

if result.stderr:
    print(result.stderr)

# Check whether training succeeded
if result.returncode != 0:
    print("Pipeline failed.")
    sys.exit(result.returncode)

# Load evaluation metrics
metrics_file = project_dir / "artifacts" / "metrics.json"

if metrics_file.exists():
    metrics = json.loads(
        metrics_file.read_text(encoding="utf-8")
    )

    print("\nVoltGrid pipeline completed successfully!")
    print("Evaluation metrics:")
    print(json.dumps(metrics, indent=2))
else:
    print("ERROR: metrics.json was not created.")
    sys.exit(1)