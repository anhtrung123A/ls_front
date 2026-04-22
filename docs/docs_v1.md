# API Docs

Base URL: `/api/v1`

## 1) Create User
- **Method/Path**: `POST /users`
- **Input (JSON body)**:
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "phonenumber": "0901234567",
  "dateOfBirth": "1998-05-20"
}
```
- **Output**:
  - `201 Created`: tạo user thành công
  - `400 Bad Request`: thiếu/sai định dạng input
  - `409 Conflict`: vi phạm business rule (ví dụ dữ liệu đã tồn tại)
  - `502 Bad Gateway`: lỗi gọi external service
  - `500 Internal Server Error`: lỗi hệ thống
- **Response mẫu (201)**:
```json
{
  "success": true,
  "message": "User created successfully.",
  "data": {
    "id": 1,
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "phonenumber": "0901234567",
    "dateOfBirth": "1998-05-20",
    "createdAt": "2026-04-22T12:00:00Z",
    "updatedAt": "2026-04-22T12:00:00Z"
  }
}
```
- **Response mẫu (400)**:
```json
{
  "success": false,
  "message": "Validation failed.",
  "data": {
    "Email": [
      "'Email' is not a valid email address."
    ]
  }
}
```

## 2) Get User Profile
- **Method/Path**: `GET /users/user_profile`
- **Auth**: `Bearer JWT` (header `Authorization: Bearer <token>`)
- **Input**: không có body
- **Output**:
  - `200 OK`: lấy profile thành công
  - `401 Unauthorized`: thiếu/sai/hết hạn token
  - `404 Not Found`: không tìm thấy user
  - `500 Internal Server Error`: lỗi hệ thống
- **Response mẫu (200)**:
```json
{
  "success": true,
  "message": "User profile fetched successfully.",
  "data": {
    "id": 1,
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "avatarUrl": "http://localhost:9000/app-bucket/avatars/1/abcd1234....png",
    "phonenumber": "0901234567",
    "dateOfBirth": "1998-05-20"
  }
}
```
- **Response mẫu (401)**:
```json
{
  "success": false,
  "message": "Token is invalid.",
  "data": null
}
```

## 3) Upload User Avatar
- **Method/Path**: `POST /users/avatar`
- **Auth**: `Bearer JWT` (header `Authorization: Bearer <token>`)
- **Input (`multipart/form-data`)**:
  - `avatar` (file) - bắt buộc, hỗ trợ `image/jpeg`, `image/png`, `image/webp`
- **Output**:
  - `200 OK`: upload avatar thành công
  - `400 Bad Request`: thiếu file / sai định dạng / quá dung lượng
  - `401 Unauthorized`: thiếu/sai/hết hạn token
  - `404 Not Found`: không tìm thấy user
  - `500 Internal Server Error`: lỗi hệ thống
- **Response mẫu (200)**:
```json
{
  "success": true,
  "message": "User avatar uploaded successfully.",
  "data": {
    "id": 12,
    "objectKey": "avatars/1/2f52e7...d8a9.png",
    "url": "http://localhost:9000/app-bucket/avatars/1/2f52e7...d8a9.png",
    "fileName": "avatar.png",
    "contentType": "image/png",
    "size": 48213,
    "createdAt": "2026-04-22T13:00:00Z"
  }
}
```
- **Response mẫu (400)**:
```json
{
  "success": false,
  "message": "Validation failed.",
  "data": {
    "Avatar.ContentType": [
      "Avatar content type is not supported."
    ]
  }
}
```

## 4) Edit User Avatar
- **Method/Path**: `PUT /users/avatar`
- **Auth**: `Bearer JWT` (header `Authorization: Bearer <token>`)
- **Input (`multipart/form-data`)**:
  - `avatar` (file) - bắt buộc
- **Output**:
  - `200 OK`: cập nhật avatar thành công
  - `400 Bad Request`: thiếu file / sai định dạng / quá dung lượng
  - `401 Unauthorized`: thiếu/sai/hết hạn token
  - `404 Not Found`: không tìm thấy user
  - `500 Internal Server Error`: lỗi hệ thống
- **Response mẫu (200)**:
```json
{
  "success": true,
  "message": "User avatar updated successfully.",
  "data": {
    "id": 13,
    "objectKey": "avatars/1/9c1aef...410b.png",
    "url": "http://localhost:9000/app-bucket/avatars/1/9c1aef...410b.png",
    "fileName": "avatar.png",
    "contentType": "image/png",
    "size": 50120,
    "createdAt": "2026-04-22T13:15:00Z"
  }
}
```

## 5) Delete User Avatar
- **Method/Path**: `DELETE /users/avatar`
- **Auth**: `Bearer JWT` (header `Authorization: Bearer <token>`)
- **Input**: không có body
- **Output**:
  - `200 OK`: xóa avatar thành công
  - `401 Unauthorized`: thiếu/sai/hết hạn token
  - `404 Not Found`: không tìm thấy user
  - `500 Internal Server Error`: lỗi hệ thống
- **Response mẫu (200)**:
```json
{
  "success": true,
  "message": "User avatar deleted successfully.",
  "data": {
    "deleted": true
  }
}
```

## Response format chung
- **Success**:
```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```
- **Error**:
```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```
