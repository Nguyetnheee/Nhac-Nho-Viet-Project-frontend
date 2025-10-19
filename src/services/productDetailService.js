import api from './api';
import { trayService } from './trayService';

export const getProductDetails = async (productId) => {
  try {
    console.log('Fetching product details for ID:', productId);
    
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, proceeding without authentication');
    }

    // Thử lấy thông tin sản phẩm cơ bản trước
    const detailsResponse = await trayService.getTrayById(productId);
    console.log('Basic product info:', detailsResponse?.data);

    if (!detailsResponse?.data) {
      throw new Error('Could not fetch basic product information');
    }

    // Kết hợp thông tin và trả về
    return {
      data: {
        productDetailId: detailsResponse.data.productId,
        product: {
          ...detailsResponse.data,
          category: {
            categoryId: detailsResponse.data.categoryId,
            categoryName: detailsResponse.data.categoryName
          },
          region: {
            regionId: detailsResponse.data.regionId,
            regionName: detailsResponse.data.regionName
          }
        }
      }
    };
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};