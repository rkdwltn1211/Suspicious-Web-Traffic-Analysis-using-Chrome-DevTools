# Network Traffic Detection DevTools Extension

Chrome DevTools 기반으로 네트워크 요청 정보를 수집하고,  
학습된 머신러닝 모델을 활용해 트래픽을 분류하는 프로젝트입니다.

## Project Overview

이 프로젝트는 브라우저 환경에서 발생하는 네트워크 요청 정보를 수집한 뒤,  
사전에 학습한 모델을 통해 트래픽 특징을 분석하고 분류하는 것을 목표로 합니다.

프로젝트는 크게 두 부분으로 구성됩니다.

- **Chrome DevTools Extension**
  - 브라우저의 네트워크 요청 데이터를 수집
  - DevTools Panel에서 결과 확인
- **Machine Learning Pipeline**
  - 트래픽 feature 전처리
  - 모델 학습 및 비교
  - TensorFlow.js 형식으로 변환하여 확장프로그램에 적용

---

## Main Features

- Chrome DevTools 기반 네트워크 요청 수집
- 트래픽 feature 추출 및 전처리
- 머신러닝 모델 학습 및 비교
- TensorFlow.js 모델을 활용한 브라우저 내 추론
- DevTools Panel UI를 통한 결과 확인

---

## Project Structure

```text
network-traffic-devtools-extension/
├── extension/
│   ├── background.js
│   ├── collector.js
│   ├── content_script.js
│   ├── devtools.html
│   ├── devtools.js
│   ├── panel.html
│   ├── panel_bootstrap.js
│   ├── predictor.js
│   ├── features.js
│   ├── manifest.json
│   └── tfjs_model/
│       ├── model.json
│       └── group1-shard1of1.bin
│
├── models/
│   └── keras/
│       └── traffic_classifier.keras
│
├── training/
│   ├── 01_data_preprocessing.ipynb
│   ├── 02_feature_extraction.ipynb
│   ├── 03_model_export_to_h5.ipynb
│   ├── 04_model_comparison_random_forest_linear_regression.ipynb
│   └── traffic_features_v1.json
│
│
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
