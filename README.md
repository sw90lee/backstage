# Backstage 플러그인 구성 가이드

## 개요
이 Backstage 인스턴스는 다음과 같은 플러그인들이 구성되어 있습니다:
- Jenkins CI/CD 통합
- ArgoCD 배포 관리
- Keycloak 인증
- Kubernetes 클러스터 관리 (커스텀 클러스터 발견 기능 포함)

## 설치된 플러그인

### 1. Jenkins Plugin
**목적**: Jenkins 빌드 및 파이프라인 정보를 Backstage에서 조회

**설정 방법**:
1. `app-config.yaml`에 Jenkins 서버 정보 추가:
```yaml
jenkins:
  instances:
    - name: default
      baseUrl: https://jenkins.example.com
      username: ${JENKINS_USERNAME}
      apiKey: ${JENKINS_API_TOKEN}
```

2. 환경변수 설정:
```bash
export JENKINS_USERNAME=your-username
export JENKINS_API_TOKEN=your-api-token
```

**사용 방법**:
- 카탈로그 엔티티에 어노테이션 추가:
```yaml
metadata:
  annotations:
    jenkins.io/job-full-name: "folder-name/job-name"
```

### 2. ArgoCD Plugin
**목적**: ArgoCD 애플리케이션 배포 상태 모니터링

**설정 방법**:
1. `app-config.yaml`에 ArgoCD 인스턴스 구성:
```yaml
argocd:
  appLocatorMethods:
    - type: 'config'
      instances:
        - name: argoInstance1
          url: https://argocd.example.com
          token: ${ARGOCD_AUTH_TOKEN}
```

**사용 방법**:
- 컴포넌트에 ArgoCD 어노테이션 추가:
```yaml
metadata:
  annotations:
    argocd/app-name: myapp
    argocd/instance-name: argoInstance1
```

### 3. Keycloak 인증
**목적**: Keycloak을 통한 SSO 인증 제공

**설정 방법**:
1. 환경변수 설정 (`.env` 파일):
```bash
AUTH_KEYCLOAK_CLIENT_ID=backstage
AUTH_KEYCLOAK_CLIENT_SECRET=your-secret
AUTH_KEYCLOAK_METADATA_URL=https://keycloak.example.com/auth/realms/backstage/.well-known/openid_configuration
```

2. `app-config.yaml`에 인증 구성:
```yaml
auth:
  environment: development
  providers:
    keycloak:
      development:
        clientId: ${AUTH_KEYCLOAK_CLIENT_ID}
        clientSecret: ${AUTH_KEYCLOAK_CLIENT_SECRET}
        metadataUrl: ${AUTH_KEYCLOAK_METADATA_URL}
```

**기능**:
- OpenID Connect 프로토콜 사용
- 스코프: `openid`, `profile`, `email`, `groups`
- 팝업 로그인 지원

### 4. Kubernetes Plugin (커스텀 확장)
**목적**: Kubernetes 클러스터 정보 동적 관리

**특징**:
- `CustomClustersSupplier` 클래스로 클러스터 목록 동적 관리
- 60분마다 자동 클러스터 갱신
- 외부 소스에서 클러스터 정보 가져오기 가능

**커스텀 구현 위치**:
- `packages/backend/plugins/kubernetes.ts`: 커스텀 클러스터 공급자
- `packages/backend/src/index.ts:32-47`: 백엔드 모듈 등록

**확장 방법**:
`refreshClusters()` 메서드를 수정하여 원하는 소스에서 클러스터 정보 가져오기:
```typescript
async refreshClusters(): Promise<void> {
  // 예: API 호출로 클러스터 목록 가져오기
  const clusters = await fetchClustersFromAPI();
  this.clusterDetails = clusters;
}
```

## 시작하기

### 1. 의존성 설치
```bash
yarn install
```

### 2. 환경변수 설정
`.env` 파일을 생성하고 필요한 환경변수들을 설정하세요.

### 3. 개발 서버 실행
```bash
# 백엔드 실행
yarn start-backend

# 프론트엔드 실행  
yarn start
```

### 4. 프로덕션 빌드
```bash
yarn build:all
```

## 구성 파일 위치
- **Frontend 플러그인**: `packages/app/package.json`
- **Backend 플러그인**: `packages/backend/src/index.ts`
- **API 구성**: `packages/app/src/apis.ts`
- **커스텀 Kubernetes 모듈**: `packages/backend/plugins/kubernetes.ts`
- **애플리케이션 설정**: `app-config.yaml`

## 추가 정보
각 플러그인의 상세한 설정 및 사용법은 해당 플러그인의 공식 문서를 참조하세요:
- [Jenkins Plugin](https://github.com/backstage/community-plugins/tree/main/workspaces/jenkins)
- [ArgoCD Plugin](https://roadie.io/backstage/plugins/argo-cd/)
- [Kubernetes Plugin](https://backstage.io/docs/features/kubernetes/)