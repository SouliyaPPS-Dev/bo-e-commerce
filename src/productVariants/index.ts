import InventoryIcon from '@mui/icons-material/Inventory2';
import ProductVariantList from './ProductVariantList';
import ProductVariantCreate from './ProductVariantCreate';
import ProductVariantEdit from './ProductVariantEdit';

export default {
  list: ProductVariantList,
  create: ProductVariantCreate,
  edit: ProductVariantEdit,
  icon: InventoryIcon,
  recordRepresentation: (record: any) => record?.name || record?.sku || 'Variant',
};
