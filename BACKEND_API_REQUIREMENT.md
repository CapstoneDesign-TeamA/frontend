# 프로필 수정 기능 백엔드 API 구현 요청

## 📋 개요
사용자가 마이페이지에서 프로필(이름, 프로필 이미지)을 수정할 수 있는 백엔드 API를 구현해주세요.
프론트엔드에서는 이미 구현이 완료되었으며, 백엔드 API가 구현되면 바로 연동됩니다.

---

## 🔌 API 명세

### 1. 프로필 업데이트

**엔드포인트**: `PUT /api/users/profile`

**인증**: Bearer Token (JWT)

**Request Headers**:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "사용자이름",
  "profileImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Request Body 설명**:
- `name` (optional, string): 사용자 이름
- `profileImage` (optional, string): 프로필 이미지 (Base64 인코딩된 문자열)

**Response (200 OK)**:
```json
{
  "userId": 1,
  "nickname": "사용자닉네임",
  "email": "user@example.com",
  "profileImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "interests": ["여행", "음악", "운동"],
  "message": "프로필이 업데이트되었습니다"
}
```

**Error Response (401 Unauthorized)**:
```json
{
  "error": "Invalid token",
  "message": "유효하지 않은 토큰입니다"
}
```

**Error Response (404 Not Found)**:
```json
{
  "error": "User not found",
  "message": "사용자를 찾을 수 없습니다"
}
```

---

### 2. 내 프로필 조회

**엔드포인트**: `GET /api/users/me`

**인증**: Bearer Token (JWT)

**Request Headers**:
```
Authorization: Bearer {access_token}
```

**Response (200 OK)**:
```json
{
  "userId": 1,
  "name": "사용자이름",
  "email": "user@example.com",
  "profileImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Error Response (401 Unauthorized)**:
```json
{
  "error": "Invalid token",
  "message": "유효하지 않은 토큰입니다"
}
```

---

## 🗄️ 데이터베이스 스키마

### Users 테이블 수정

기존 `users` 테이블에 다음 컬럼을 추가해주세요 (없는 경우):

```sql
ALTER TABLE users 
ADD COLUMN name VARCHAR(255),
ADD COLUMN profile_image TEXT;
```

**컬럼 설명**:
- `name` (VARCHAR(255), nullable): 사용자 이름
- `profile_image` (TEXT, nullable): Base64 인코딩된 프로필 이미지 문자열

---

## ⚙️ 구현 요구사항

### 1. 인증 및 권한
- JWT 토큰으로 사용자 인증
- `Authorization` 헤더에서 Bearer 토큰 추출
- 토큰에서 사용자 ID 추출하여 본인의 프로필만 수정 가능하도록 처리

### 2. 프로필 업데이트 로직
- `name`과 `profileImage`는 모두 선택적(optional) 필드
- 전달된 필드만 업데이트 (null이 아닌 경우)
- `profileImage`는 Base64 문자열 그대로 데이터베이스에 저장
- 업데이트 성공 시 변경된 사용자 정보 반환

### 3. 프로필 조회 로직
- JWT 토큰에서 사용자 ID 추출
- 해당 사용자의 정보 조회하여 반환
- `profileImage`가 null이면 빈 문자열 또는 null 반환

### 4. 에러 처리
- 유효하지 않은 토큰: 401 Unauthorized
- 존재하지 않는 사용자: 404 Not Found
- 서버 에러: 500 Internal Server Error

### 5. CORS 설정
- 프론트엔드 개발 서버(`http://localhost:3001`)에서 접근 가능하도록 CORS 설정

---

## 🔧 Spring Boot 구현 예시

### Controller 예시

```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(
            @RequestHeader("Authorization") String token
    ) {
        // JWT 토큰에서 사용자 ID 추출
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        
        UserResponse user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileUpdateResponse> updateProfile(
            @RequestHeader("Authorization") String token,
            @RequestBody UserProfileUpdateRequest request
    ) {
        // JWT 토큰에서 사용자 ID 추출
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        
        UserProfileUpdateResponse response = userService.updateProfile(userId, request);
        return ResponseEntity.ok(response);
    }
}
```

### DTO 예시

```java
// Request DTO
@Data
public class UserProfileUpdateRequest {
    private String name;
    private String profileImage;
}

// Response DTO
@Data
@Builder
public class UserProfileUpdateResponse {
    private Long userId;
    private String name;
    private String email;
    private String profileImage;
    private String message;
}

@Data
@Builder
public class UserResponse {
    private Long userId;
    private String name;
    private String email;
    private String profileImage;
}
```

### Service 예시

```java
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다"));
        
        return UserResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .profileImage(user.getProfileImage())
                .build();
    }

    @Transactional
    public UserProfileUpdateResponse updateProfile(
            Long userId, 
            UserProfileUpdateRequest request
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다"));
        
        // 이름 업데이트 (null이 아닌 경우)
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        
        // 프로필 이미지 업데이트 (null이 아닌 경우)
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }
        
        userRepository.save(user);
        
        return UserProfileUpdateResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .profileImage(user.getProfileImage())
                .message("프로필이 업데이트되었습니다")
                .build();
    }
}
```

### Entity 예시

```java
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(length = 255)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String profileImage;
    
    // 기타 필드들...
}
```

---

## 🧪 테스트 방법

### 1. 프로필 업데이트 테스트

**cURL 예시**:
```bash
curl -X PUT http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "홍길동",
    "profileImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }'
```

### 2. 프로필 조회 테스트

**cURL 예시**:
```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📝 프론트엔드 연동 정보

프론트엔드에서는 다음과 같이 API를 호출합니다:

### API 호출 코드 (`src/lib/api/user.ts`)

```typescript
import { fetcher } from "./fetcher";

export interface UpdateProfileRequest {
    name?: string;
    profileImage?: string;
}

export interface UpdateProfileResponse {
    userId: number;
    name: string;
    email: string;
    profileImage: string | null;
    message: string;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    return fetcher("/users/profile", {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function fetchMyProfile(): Promise<UpdateProfileResponse> {
    return fetcher("/users/me", {
        method: "GET",
    });
}
```

### 토큰 전송 방식

프론트엔드의 `fetcher` 함수는 자동으로:
1. `localStorage`에서 `access_token` 가져오기
2. `Authorization: Bearer {token}` 헤더에 추가
3. 백엔드 API 호출

---

## ✅ 체크리스트

백엔드 구현 시 다음 사항을 확인해주세요:

- [ ] `PUT /api/users/profile` 엔드포인트 구현
- [ ] `GET /api/users/me` 엔드포인트 구현
- [ ] JWT 토큰 인증 구현
- [ ] 사용자 테이블에 `name`, `profile_image` 컬럼 추가
- [ ] Base64 이미지 문자열 저장 처리
- [ ] CORS 설정 완료
- [ ] 에러 처리 구현 (401, 404, 500)
- [ ] API 테스트 완료

---

## 🚀 배포 정보

- **프론트엔드 개발 서버**: `http://localhost:3001`
- **백엔드 개발 서버**: `http://localhost:8080` (예상)
- **API Base URL 환경변수**: `VITE_API_BASE_URL`

---

## 📞 문의사항

구현 중 질문이나 문제가 있으면 언제든지 연락주세요!

---

**작성일**: 2024년 12월 5일
**작성자**: 프론트엔드 팀

