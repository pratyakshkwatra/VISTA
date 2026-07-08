import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

def train_model():
    print("Training mock AQI prediction model...")
    # Mock dataset: [temperature, humidity, traffic_volume]
    X = [[35, 60, 1000], [20, 40, 500], [40, 70, 1500], [25, 50, 800]]
    # 0 = Good, 1 = Moderate, 2 = Severe
    y = [1, 0, 2, 0]
    
    clf = RandomForestClassifier(n_estimators=10)
    clf.fit(X, y)
    
    # Save the model
    joblib.dump(clf, "aqi_model.pkl")
    print("Model saved to aqi_model.pkl")

def predict_aqi(temp, humidity, traffic):
    try:
        clf = joblib.load("aqi_model.pkl")
        return clf.predict([[temp, humidity, traffic]])[0]
    except FileNotFoundError:
        print("Model not found. Train first.")
        return None

if __name__ == "__main__":
    train_model()
