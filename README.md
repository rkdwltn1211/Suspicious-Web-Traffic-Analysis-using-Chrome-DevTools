
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


문제는 이러한 트래픽이  **겉보기에는 정상 요청과 유사할 수 있어**,  
단순 rule 기반 탐지만으로는 구분에 한계가 있다는 점입니다.  
본 프로젝트는 이 문제를 해결하기 위해  **행동 기반 feature + 머신러닝 분류 모델**이라는 접근을 적용했습니다. 

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
- n_estimators =300
- class_weight = "balance"

---
## Results

### Logistic Regression
Confusion Matrix:
[[82, 6],
 [ 1,13]]

해석:
-정상 → 정상: 82
-정상 → 의심: 6
-의심 → 정상: 1
-의심 → 의심: 13

주요 특징:
- **Precision(suspicious):1.00**
- **Recall(suspicious):0.857**
- **False Positive: 0**

즉, Random Forest는 의심 트래픽 일부를 놓칠 수는 있지만
**오탐(False Positive)을 완전히 제거하는 보수적인 탐지 성향**을 보였습니다. 

---
## Model Comparison

| Model               | Recall (suspicious) | Precision (suspicious) | False Positive | False Negative |
| ------------------- | ------------------: | ---------------------: | -------------: | -------------: |
| Logistic Regression |                0.93 |                   0.68 |              6 |              1 |
| Random Forest       |               0.857 |                   1.00 |              0 |              2 |

### Interpretation
-#### Logistic Regression
  - suspicious traffic을 놓치지 않는 데 유리
  - 보안 탐지 관점에서 안정적
  - 해석 가능성이 높음
- #### Random Forest
  - 오탐 최소화에 유리
  - 실제 경고/차단 시스템에서 보수적 정책에 적합
  - 복잡한 패턴 학습 가능
 
프로젝트에서는 이 비교를 통해 **탐지 우선 전략 vs 정확도 우선 전략**의 차이를 명확하게 확인했습니다.

---
## Feture Importance
Random Forest feature importance 분석 결과,
**상위 6개 feature가 전체 중요도의 약 86%를 차지**했습니다.

이는 모델이 단순 노이즈가 아닌,

-트래픽 규모 관련 feature
-희소 이벤트 관련 feature
-비정상 패턴 비율 관련 feature

같은 핵심 행동 지표에 집중해 판단하고 있음을 보여줍니다.

---
## System Architecture

이 프로젝트는 단순 모델링에 그치지 않고,
브라우저 환경에서 실제로 동작하는 end-to-end 탐지 흐름까지 구현했습니다.

```text
Browser Traffic
    ↓
DevTools Collector
    ↓
Feature Extraction
    ↓
ML Model Inference
    ↓
Suspicious Score
    ↓
Warning in DevTools Panel
```

즉,

-트래픽 수집
-feature 생성
-모델 추론
-사용자 경고 표시
까지 하나의 흐름으로 연결했습니다.

---
## Tech Stack

- Python
- scikit-learn
- TensorFlow / Keras
- TensorFlow.js
- JavaScript
- Chrome DevTools API
- Chrome Extension API
- Jupyter Notebook


---
## Key Takeaways
이 프로젝트를 통해 확인한 점은 다음과 같습니다.

-행동기반 feature만으로 suspicious traffic 분류가 가능하다. 
-Logistic Regression은 미탐 최소화 측면에서 강점을 보였다.
-Random Forest는 오탐 최소화 측면에서 강점을 보였다.
-브라우저 환경에서도 경량 ML 기반 탐지 시스템을 구현할 수 있다.

---
## Limitations

-라벨링이 rule 기반 weak labeling에 의존함
-suspicious class 비율이 낮은 불균형 데이터
-패킷 내용이 아닌 행동 feature만 사용했기 때문에 정교한 공격 유형 구분에는 한계가 있음

---
## Future Work
향후에는 다음 방향으로 확장할 수 있습니다.

-라벨 품질 개선
-추가 feature 설계
-threshold tuning
-시계열 정보 반영
-위험도 기반 동적 경고 정책 적용

---
## One-line Summary
**웹 트래픽 행동 패턴을 요약한 feature를 기반으로 suspicious traffic을 탐지하는 머신러닝 모델을 구축하고, 브라우저 DevTools 환경에서 실제 경고 흐름까지 구현**한 프로젝트입니다.
