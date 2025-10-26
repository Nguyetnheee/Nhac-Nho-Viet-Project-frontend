// src/utils/dataUtils.js

/**
 * Nhóm các mục checklist (item) theo tên lễ hội (ritualName) và ritualId.
 * Dữ liệu trả về từ API /api/checklists là một danh sách phẳng.
 * @param {Array<Object>} checklistItems - Danh sách phẳng các mục checklist.
 * @returns {Array<Object>} - Danh sách các lễ hội, mỗi lễ hội chứa danh sách các mục (items).
 */
export const groupChecklistsByRitualName = (checklistItems) => {
  const grouped = checklistItems.reduce((acc, item) => {
    // Sử dụng ritualId làm key để nhóm cho chính xác hơn
    const key = item.ritualId;
    
    // Đảm bảo item có ritualId và ritualName
    if (!key || !item.ritualName) {
        return acc;
    }

    if (!acc[key]) {
      acc[key] = {
        // Lấy thông tin chung của lễ hội từ item đầu tiên
        ritualName: item.ritualName,
        ritualId: item.ritualId,
        items: []
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {});

  // Chuyển object thành array để dễ dàng map trong React
  return Object.values(grouped);
};