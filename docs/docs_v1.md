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
