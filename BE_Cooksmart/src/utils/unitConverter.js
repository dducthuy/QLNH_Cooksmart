/**
 * Chuyển đổi số lượng giữa các đơn vị đo lường phổ biến
 * @param {number|string} amount - Số lượng ban đầu
 * @param {string} fromUnit - Đơn vị gốc (của công thức)
 * @param {string} toUnit - Đơn vị đích (của kho)
 * @returns {number} Số lượng đã được quy đổi ra đơn vị đích
 */
function convertUnit(amount, fromUnit, toUnit) {
    const value = Number(amount);
    if (isNaN(value) || value <= 0) return 0;

    if (!fromUnit || !toUnit) return value; // Nếu 1 trong 2 không có đơn vị, giữ nguyên 1:1

    const from = fromUnit.toLowerCase().trim();
    const to = toUnit.toLowerCase().trim();

    if (from === to) return value; // Cùng đơn vị -> 1:1

    // Quy đổi khối lượng
    const massMap = {
        'kg': 1000,
        'kilogram': 1000,
        'g': 1,
        'gram': 1
    };

    // Quy đổi thể tích
    const volumeMap = {
        'l': 1000,
        'lít': 1000,
        'lit': 1000,
        'ml': 1,
        'mililit': 1
    };

    // Kiểm tra xem cả 2 đơn vị có cùng nằm trong nhóm khối lượng không
    if (massMap[from] && massMap[to]) {
        const fromGrams = value * massMap[from];
        return fromGrams / massMap[to];
    }

    // Kiểm tra xem cả 2 đơn vị có cùng nằm trong nhóm thể tích không
    if (volumeMap[from] && volumeMap[to]) {
        const fromMl = value * volumeMap[from];
        return fromMl / volumeMap[to];
    }


    return value;
}

module.exports = {
    convertUnit
};
