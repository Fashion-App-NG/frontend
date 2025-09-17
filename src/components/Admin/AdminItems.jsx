
const ItemsTable = ({ columns, items }) => {
    return (
        <div className="mt-4">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50">
                        {columns.map((col) => (
                            <th key={col.key} className="p-2 text-left">{col.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="p-2 text-center text-gray-500">
                                No items found.
                            </td>
                        </tr>
                        ) : (
                        items.map((item, index) => (
                            <tr key={item.id || index} className="border-b">
                                {columns.map((col) => (
                                    <td key={col.key} className="p-2">
                                        {typeof col.render === 'function' ? col.render(item) : item[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>  
            </table>
        </div>
    );
};

export default ItemsTable;