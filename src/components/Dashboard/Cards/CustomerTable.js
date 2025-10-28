import React, { useMemo } from 'react';
import { rows } from '../../../data/customer-data/rows'; 
import { currencyFormat } from '../../../helpers/format-functions';

const filterRows = (data, searchText) => {
    if (!searchText) return data;
    const lowerCaseSearch = searchText.toLowerCase();
    return data.filter(row => 
        row.name.toLowerCase().includes(lowerCaseSearch) ||
        row.email.toLowerCase().includes(lowerCaseSearch) ||
        row['billing-address'].toLowerCase().includes(lowerCaseSearch)
    );
};

const CustomerTable = ({ searchText }) => {
    const visibleRows = useMemo(() => {
        return filterRows(rows, searchText);
    }, [searchText]);

    return (
        <div className="customer-table-container" style={{ overflowX: 'auto', minHeight: 325 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #424242' }}>
                        <th style={tableHeaderStyle}>Name</th>
                        <th style={tableHeaderStyle}>Email</th>
                        <th style={tableHeaderStyle}>Phone</th>
                        <th style={tableHeaderStyle}>Billing Address</th>
                        <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Total Spent</th>
                        <th style={tableHeaderStyle}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {visibleRows.length > 0 ? (
                        visibleRows.map((row) => (
                            <tr key={row.id} style={{ borderBottom: '1px solid #333' }}>
                                <td style={tableCellStyle}>{row.name}</td>
                                <td style={tableCellStyle}>{row.email}</td>
                                <td style={tableCellStyle}>{row.phone}</td>
                                <td style={tableCellStyle}>{row['billing-address']}</td>
                                <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                                    {currencyFormat(row['total-spent'])} 
                                </td>
                                <td style={tableCellStyle}>
                                    <button style={actionButtonStyle}>Edit</button>
                                    <button style={{ ...actionButtonStyle, color: 'red' }}>Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#B0B0B0' }}>
                                No results found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const tableHeaderStyle = { padding: '15px 10px', textAlign: 'left', fontSize: 14, color: '#B0B0B0' };
const tableCellStyle = { padding: '15px 10px', fontSize: 14 };
const actionButtonStyle = { background: 'none', border: 'none', color: '#36B37E', cursor: 'pointer', fontSize: 14, marginRight: 10 };

export default CustomerTable;