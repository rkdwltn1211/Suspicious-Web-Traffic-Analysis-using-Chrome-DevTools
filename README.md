
# Web Traffic Suspicious Behavior Detection
### Behavior-based suspicious traffic detection with Machine Learning and Chrome DevTools

브라우저 DevTools 환경에서 수집한 **웹 트래픽 행동 패턴(feature)**을 기반으로,  
정상 트래픽과 의심 트래픽을 구분하는 **머신러닝 기반 탐지 시스템**을 구현한 프로젝트입니다.

이 프로젝트는 단순 rule 기반 탐지를 넘어,  
**트래픽의 내용(payload)이 아닌 행동 패턴만으로 의심 트래픽을 탐지할 수 있는지**를 검증하는 데 초점을 맞췄습니다. 

---

## Overview

웹 환경에서는 정상 사용자 요청 외에도 다음과 같은 비정상 접근이 함께 발생합니다.

- 반복적인 자동화 요청
- 크롤링/봇 기반 접근
- 비정상적인 요청 빈도 및 간격
- 의심스러운 패턴을 보이는 웹 트래픽

문제는 이러한 트래픽이 **겉보기에는 정상 요청과 유사할 수 있어**,  
단순 rule 기반 탐지만으로는 구분에 한계가 있다는 점입니다.  
본 프로젝트는 이 문제를 해결하기 위해 **행동 기반 feature + 머신러닝 분류 모델**이라는 접근을 적용했습니다. 
---

## Why this project matters

일반적인 탐지 방식은 다음에 의존하는 경우가 많습니다.

- payload 검사
- signature 기반 탐지
- 정적 rule 기반 필터링

하지만 본 프로젝트는 다음 질문에서 출발했습니다.

> **브라우저 환경에서 수집 가능한 최소한의 트래픽 정보만으로도 의심 트래픽 탐지가 가능한가?**

이를 위해 요청 빈도, 시간 간격, 분포 특성 등  
**행동 패턴을 요약한 14개의 통계 feature**를 설계하고,  
이를 기반으로 의심 트래픽을 분류하는 모델을 구축했습니다. 

---

## Project Goal

이 프로젝트의 목표는 다음과 같습니다.

1. 웹 트래픽 행동을 요약하는 feature를 설계한다.
2. 해당 feature만으로 suspicious traffic 분류가 가능한지 검증한다.
3. 여러 ML 모델을 비교해 탐지 성향을 분석한다.
4. 최종 모델을 브라우저 DevTools 환경에 연결해 실제 경고 흐름까지 구현한다. 

---

## Data

브라우저 환경에서 DevTools를 이용해 웹 트래픽을 수집하고,  
feature를 계산한 뒤 JSON 형식으로 저장했습니다. 

### Dataset summary

- **총 수집 트래픽 수:** 4,046
- **학습에 사용한 데이터:** 506
- **Feature 수:** 14
- **Label:**  
  - `0`: benign  
  - `1`: suspicious
- **데이터 특성:** 클래스 불균형 (suspicious 비율이 낮음) 

### Data structure


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
```
---
## Feature Engineering
본 프로젝트에서는 개별 패킷의 내용을 해석하기보다, 트랙픽의 행동 패턴을 요약하는 통계 feature를 사용했습니다.
대표 feature 예시는 다음과 같습니다.

| Feature | Description                   |
| ------- | ----------------------------- |
| f0      | Total Traffic Volume          |
| f2      | Request Size Variability      |
| f3      | Behavioral Irregularity Score |
| f6      | Rare Event Activation Rate    |
| f9      | Suspicious Pattern Ratio      |
| f12     | Extreme Behavior Indicator    |


이 feature들은 다음과 같은 특성을 반영합니다.

-트래픽 규모
-요청 크기 변화
-요청 패턴의 불규칙성
-희소 이벤트 발생 여부
-비정상 행동 비율
즉, 이 프로젝트는 **content-based detection이 아니라 behavior-based detection**에 가깝습니다

---
## Modeling Strategy
프로젝트에서는 두 가지 모델을 중심으로 비교했습니다

### 1) Logistic Regression
가장 먼저 **설명 가능하고 해석이 쉬운 baseline 모델**로 Logistic Regression을 적용했습니다. 

적용한 처리:
- StandardScaler
- class_weight = "balanced"

이 모델은 feature 자체가 suspicious traffic을 얼마나 잘 구분하는지 확인하는 기준점 역할을 했습니다

### 2) Random Forest
다음으로 feature 간의 **비선형 조합과 조건 기반 패턴**을 포착하기 위래 Random Forest를 적용했습니다.

적용한 설정:
-n_estimators =300
- class_weight = "balance"

---
