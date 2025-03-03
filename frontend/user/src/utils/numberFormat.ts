export const formatNumber = (value: number): string => {
    if (value >= 1e6) { // 如果值大于等于一百万
        return (value / 1e6).toFixed(1) + 'M'; // 转换为百万单位
    } else if (value >= 1e3) { // 如果值大于等于一千
        return (value / 1e3).toFixed(1) + 'K'; // 转换为千单位
    } else {
        return value.toLocaleString(); // 对于小于一千的数，使用本地化数字格式
    }
}