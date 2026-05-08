# ⚔️ Age of War — 온라인 2인 대결

Age of War 스타일의 실시간 온라인 대결 게임입니다.  
초대 코드를 공유해 친구와 언제 어디서나 대결할 수 있습니다.

---

## 🎮 게임 방법

| 요소 | 설명 |
|------|------|
| 🪙 골드 | 시간이 지나면 자동 획득. 시대가 높을수록 더 많이 획득 |
| 🗡️ 병사 소환 | 골드를 소비해 자기 기지 앞에 병사 소환 |
| 🔬 시대 진화 | 원시 → 중세 → 근대. 더 강한 유닛 해금 |
| 💥 특수 공격 | 쿨다운 후 적 진영에 광역 피해 |
| 🏰 목표 | 상대 기지 HP를 0으로 만들면 승리 |

### 시대별 유닛

| 시대 | 유닛 | 비용 | 특징 |
|------|------|------|------|
| 원시 | 전사, 투석꾼, 맹수 | 50~130 | 저비용 기본 유닛 |
| 중세 | 기사, 궁수, 투석기 | 110~220 | 균형잡힌 구성 |
| 근대 | 총병, 기관총, 대포 | 160~380 | 고화력 고비용 |

---

## 🚀 Render.com 무료 배포 방법

### 1단계 — GitHub에 올리기

```bash
git init
git add .
git commit -m "Age of War online"
# GitHub에서 새 repository 만든 뒤:
git remote add origin https://github.com/<your-username>/age-of-war.git
git push -u origin main
```

### 2단계 — Render.com 배포

1. https://render.com 접속 → **Sign Up** (GitHub 계정으로 가입 가능)
2. Dashboard → **New** → **Web Service**
3. GitHub repository 연결
4. 설정:
   - **Name**: `age-of-war` (원하는 이름)
   - **Region**: Singapore (한국과 가까움)
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free** 선택
5. **Create Web Service** 클릭

배포 완료 후 `https://age-of-war-xxxx.onrender.com` 주소가 생성됩니다.

> ⚠️ **Render 무료 플랜 주의**: 15분간 접속이 없으면 서버가 슬립 상태가 됩니다.  
> 처음 접속 시 30~60초 대기가 발생할 수 있습니다.  
> 이 문제를 피하려면 **Starter** 플랜($7/월)을 이용하세요.

---

## 💻 로컬 실행 방법 (테스트용)

```bash
npm install
npm start
# → http://localhost:3000 열기
# 브라우저 탭 두 개로 로컬 2인 테스트 가능
```

---

## 🛠️ 프로젝트 구조

```
age-of-war/
├── server.js         # Node.js WebSocket 서버
├── package.json      # 의존성 (ws 라이브러리만 사용)
├── public/
│   └── index.html    # 게임 클라이언트 (HTML/JS/CSS 단일 파일)
└── README.md
```

---

## ⚙️ 기술 스택

- **서버**: Node.js + `ws` (WebSocket 라이브러리)
- **클라이언트**: Vanilla JS + Canvas API
- **통신**: WebSocket (실시간 액션 릴레이)
- **게임 루프**: 고정 30fps 시뮬레이션 스텝
