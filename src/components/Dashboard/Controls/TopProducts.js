import React from 'react';
import SimpleBar from 'simplebar-react';
import ProductItemRow from '../Cards/ProductItemRow'; 
import { productTableRows } from '../../../data/product-data/productTableRows';

const TopProducts = () => {
  return (
    <div 
        className="top-products-card" 
        style={{ padding: 20, height: '100%', backgroundColor: '#1E1E1E', borderRadius: 8 }}
    >
      <h3 style={{ margin: '0 0 30px 0', fontSize: 24, color: 'white' }}>
        Top Products
      </h3>
      
      <div className="table-container" style={{ height: 'auto' }}>
        <SimpleBar style={{ maxHeight: 350 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', minWidth: 440 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #424242' }}>
                <th style={headerStyle}>#</th>
                <th style={headerStyle}>Name</th>
                <th style={headerStyle}>Popularity</th>
                <th style={{...headerStyle, textAlign: 'center'}}>Sales</th>
              </tr>
            </thead>
            <tbody>
              {productTableRows.map((product) => (
                <ProductItemRow key={product.id} productItem={product} />
              ))}
            </tbody>
          </table>
        </SimpleBar>
      </div>
    </div>
  );
};

const headerStyle = { padding: '15px 10px', textAlign: 'left', fontSize: 14, color: '#B0B0B0' };

export default TopProducts;