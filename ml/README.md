# VISTA Machine Learning Module

This folder contains offline/local machine learning models for the VISTA platform.

While the primary **Evidence Fusion AI** uses the `google-genai` and `google-antigravity` SDKs via the FastAPI backend for real-time unstructured data analysis, this `ml/` directory is reserved for:
- Local Random Forest / XGBoost models (e.g. AQI forecasting based on historical sensor data)
- Exploratory data analysis (EDA) notebooks
- Custom scikit-learn pipelines

To train the mock AQI model:
```bash
pip install scikit-learn pandas joblib
python model.py
```
