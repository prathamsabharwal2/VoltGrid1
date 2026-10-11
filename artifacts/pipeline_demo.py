
from kfp import compiler, dsl
from kfp.dsl import Dataset, Input, Metrics, Model, Output


@dsl.component(
    base_image="python:3.11",
    packages_to_install=["pandas", "scikit-learn"],
)
def prepare_data(
    train_data: Output[Dataset],
    test_data: Output[Dataset],
):
    import pandas as pd
    from sklearn.model_selection import train_test_split

    data = pd.DataFrame({
        "temperature": [
            20, 22, 25, 28, 30, 32, 18, 24, 27, 35,
            21, 29, 31, 26, 23, 34, 19, 33, 36, 22,
        ],
        "humidity": [
            40, 45, 50, 55, 60, 65, 35, 48, 52, 70,
            42, 58, 63, 51, 46, 68, 38, 66, 72, 44,
        ],
        "energy_usage": [
            100, 110, 125, 140, 155, 165, 90, 120, 135, 180,
            105, 150, 160, 130, 115, 175, 95, 170, 185, 108,
        ],
    })

    train, test = train_test_split(
        data, test_size=0.25, random_state=42
    )

    train.to_csv(train_data.path, index=False)
    test.to_csv(test_data.path, index=False)


@dsl.component(
    base_image="python:3.11",
    packages_to_install=["pandas", "scikit-learn", "joblib"],
)
def train_model(
    train_data: Input[Dataset],
    model_output: Output[Model],
):
    import joblib
    import pandas as pd
    from sklearn.linear_model import LinearRegression
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler

    data = pd.read_csv(train_data.path)
    X = data[["temperature", "humidity"]]
    y = data["energy_usage"]

    model = Pipeline([
        ("scaler", StandardScaler()),
        ("regressor", LinearRegression()),
    ])

    model.fit(X, y)
    joblib.dump(model, model_output.path)


@dsl.component(
    base_image="python:3.11",
    packages_to_install=["pandas", "scikit-learn", "joblib"],
)
def evaluate_model(
    test_data: Input[Dataset],
    model_input: Input[Model],
    metrics: Output[Metrics],
):
    import joblib
    import pandas as pd
    from sklearn.metrics import mean_absolute_error, r2_score

    data = pd.read_csv(test_data.path)
    X = data[["temperature", "humidity"]]
    y = data["energy_usage"]

    model = joblib.load(model_input.path)
    predictions = model.predict(X)

    mae = mean_absolute_error(y, predictions)
    r2 = r2_score(y, predictions)

    metrics.log_metric("mean_absolute_error", float(mae))
    metrics.log_metric("r2_score", float(r2))

    print(f"MAE: {mae:.2f}")
    print(f"R2: {r2:.3f}")


@dsl.pipeline(
    name="voltgrid-energy-retraining",
    description="Prepare energy data, train and evaluate a model",
)
def voltgrid_pipeline():
    prepared = prepare_data()

    trained = train_model(
        train_data=prepared.outputs["train_data"]
    )

    evaluate_model(
        test_data=prepared.outputs["test_data"],
        model_input=trained.outputs["model_output"],
    )


if __name__ == "__main__":
    compiler.Compiler().compile(
        pipeline_func=voltgrid_pipeline,
        package_path="artifacts/voltgrid_pipeline.yaml",
    )
    print("VoltGrid pipeline compiled successfully.")
