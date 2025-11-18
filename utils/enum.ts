enum EroomType {
  FAN = "FAN",
  AIR = "AIR",
}

enum EroomStatus {
  AVAILABLE = "AVAILABLE",
  BOOKED = "BOOKED",
  LIVED_IN = "LIVED_IN",
}

enum ErepairStatus {
  NONE = "NONE",
  REQUESTED = "REQUESTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

enum EcontractStatus {
  NONE = "NONE",
  ACTIVE = "ACTIVE",
  TERMINATED = "TERMINATED",
}

enum EbillStatus {
  NONE = "NONE",
  PENDING = "PENDING",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
}

export { EroomType, EroomStatus, ErepairStatus, EcontractStatus, EbillStatus };
