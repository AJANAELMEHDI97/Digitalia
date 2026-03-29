const escapeCell = (value) => {
    if (value === null || value === undefined) {
        return "";
    }
    const normalized = typeof value === "object" ? JSON.stringify(value) : String(value);
    return `"${normalized.replace(/"/g, '""')}"`;
};
export const buildCsv = (rows, columns) => {
    const header = columns.map((column) => escapeCell(column.label)).join(",");
    const body = rows.map((row) => columns.map((column) => escapeCell(row[column.key])).join(","));
    return [header, ...body].join("\n");
};
