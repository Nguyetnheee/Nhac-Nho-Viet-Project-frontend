// Test API Response Examples
// Sử dụng file này để test các response từ backend

export const mockOrdersResponse = [
  {
    orderId: "ORD001",
    customerName: "Nguyễn Văn A",
    phoneNumber: "0901234567",
    email: "nguyenvana@email.com",
    deliveryAddress: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    totalAmount: 1500000,
    status: "PAID",
    paymentMethod: "VNPay",
    shipperName: null,
    shipperId: null,
    shipperPhone: null,
    createdAt: "2025-11-02T10:00:00",
    updatedAt: "2025-11-02T10:00:00",
    note: "Giao hàng buổi sáng trước 10h",
    items: [
      {
        productId: "1",
        productName: "Mâm cúng Tết Nguyên Đán",
        quantity: 1,
        price: 1200000
      },
      {
        productId: "2",
        productName: "Hoa quả tươi",
        quantity: 1,
        price: 300000
      }
    ]
  },
  {
    orderId: "ORD002",
    customerName: "Trần Thị B",
    phoneNumber: "0907654321",
    email: "tranthib@email.com",
    deliveryAddress: "456 Đường Nguyễn Huệ, Quận 2, TP.HCM",
    totalAmount: 800000,
    status: "CONFIRMED",
    paymentMethod: "COD",
    shipperName: null,
    shipperId: null,
    shipperPhone: null,
    createdAt: "2025-11-02T11:30:00",
    updatedAt: "2025-11-02T12:00:00",
    note: "",
    items: [
      {
        productId: "3",
        productName: "Mâm cúng rằm tháng",
        quantity: 1,
        price: 800000
      }
    ]
  },
  {
    orderId: "ORD003",
    customerName: "Lê Văn C",
    phoneNumber: "0912345678",
    email: "levanc@email.com",
    deliveryAddress: "789 Đường Võ Văn Tần, Quận 3, TP.HCM",
    totalAmount: 2000000,
    status: "SHIPPING",
    paymentMethod: "VNPay",
    shipperName: "Shipper Nguyễn",
    shipperId: "SHIP001",
    shipperPhone: "0908888888",
    createdAt: "2025-11-01T15:00:00",
    updatedAt: "2025-11-02T09:00:00",
    note: "Gọi trước 15 phút",
    items: [
      {
        productId: "4",
        productName: "Mâm cúng lễ Giỗ",
        quantity: 2,
        price: 1000000
      }
    ]
  }
];

export const mockShippersResponse = [
  {
    shipperId: "SHIP001",
    name: "Nguyễn Văn Shipper",
    username: "shipper_nguyen",
    phoneNumber: "0908888888",
    email: "shipper1@email.com",
    status: "ACTIVE"
  },
  {
    shipperId: "SHIP002",
    name: "Trần Thị Shipper",
    username: "shipper_tran",
    phoneNumber: "0909999999",
    email: "shipper2@email.com",
    status: "ACTIVE"
  },
  {
    shipperId: "SHIP003",
    name: "Lê Văn Shipper",
    username: "shipper_le",
    phoneNumber: "0901111111",
    email: "shipper3@email.com",
    status: "ACTIVE"
  }
];

export const mockShipperProfileResponse = {
  shipperId: "SHIP001",
  name: "Nguyễn Văn Shipper",
  username: "shipper_nguyen",
  phoneNumber: "0908888888",
  email: "shipper1@email.com",
  status: "ACTIVE",
  totalDeliveries: 156,
  successfulDeliveries: 148,
  rating: 4.8
};

export const mockConfirmOrderResponse = {
  message: "Order confirmed successfully",
  orderId: "ORD001",
  status: "CONFIRMED",
  updatedAt: "2025-11-02T13:00:00"
};

export const mockAssignOrderResponse = {
  message: "Order assigned to shipper successfully",
  orderId: "ORD002",
  shipperId: "SHIP001",
  shipperName: "Nguyễn Văn Shipper",
  updatedAt: "2025-11-02T13:15:00"
};

export const mockCancelOrderResponse = {
  message: "Order cancelled successfully",
  orderId: "ORD001",
  status: "CANCELLED",
  updatedAt: "2025-11-02T13:30:00"
};

// API Error Response Examples
export const mockErrorResponses = {
  unauthorized: {
    status: 401,
    message: "Unauthorized access"
  },
  notFound: {
    status: 404,
    message: "Order not found"
  },
  badRequest: {
    status: 400,
    message: "Invalid request"
  },
  serverError: {
    status: 500,
    message: "Internal server error"
  },
  orderAlreadyConfirmed: {
    status: 400,
    message: "Order has already been confirmed"
  },
  orderAlreadyAssigned: {
    status: 400,
    message: "Order has already been assigned to a shipper"
  },
  shipperNotFound: {
    status: 404,
    message: "Shipper not found"
  }
};
