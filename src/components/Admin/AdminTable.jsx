import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

// Orders Table
const adminTable = ({ columns, data, renderRow, renderExpandedRow, loading = false, 
    loadingMessage = "Loading...", emptyMessage = "No records found." })
 => {
    const [expandedRows, setExpandedRows] = useState([]);

    const toggleRow = (rowId) => {
        setExpandedRows((prev) =>
        prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
        );
    };

    // 🔹 Handle loading state
    if (loading) {
        return (
        <div className="text-center py-4 text-gray-600 animate-pulse">
            {loadingMessage}
        </div>
        );
    }

    // 🔹 Handle empty state
    if (!data || data.length === 0) {
        return (
        <div className="text-center py-4 text-gray-500">{emptyMessage}</div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow mt-6">
            <table className="w-full">
                <thead>
                    {renderExpandedRow && <th className="p-2"></th>}
                    <tr className="border-b">
                        {columns.map((col, idx) => (
                        <th
                            key={idx}
                            className="text-left pb-4"
                        >
                            {col}
                        </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                   {data.map((item, index) => {
                        const isExpanded = expandedRows.includes(item.id || index);
                        return (
                        <>
                            <tr key={item.id || index} className="border-b">
                                {renderExpandedRow && (
                                    <td
                                    className="p-2 cursor-pointer w-8 text-gray-500"
                                    onClick={() => toggleRow(item.id || index)}
                                    >
                                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                    </td>
                                )}
                                {renderRow(item, index)}
                            </tr>
                            {isExpanded && renderExpandedRow && (
                                <tr className="bg-gray-50">
                                    <td colSpan={columns.length + 1} className="p-4">
                                    {renderExpandedRow(item)}
                                    </td>
                                </tr>
                            )}
                        </>
                        );
                    })}
                </tbody>
            </table>
        </div>

    );

};

export default adminTable
