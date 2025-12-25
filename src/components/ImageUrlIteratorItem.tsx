import { useSimpleFormIteratorItem } from 'react-admin';
import ImageUploadField from './ImageUploadField';

interface ImageUrlIteratorItemProps {
  source: string;
  label: string;
}

const ImageUrlIteratorItem = ({ label, source }: ImageUrlIteratorItemProps) => {
  const iteratorContext = useSimpleFormIteratorItem() as ReturnType<
    typeof useSimpleFormIteratorItem
  > & {
    getSource?: (source: string) => string;
  };

  const resolvedSource =
    typeof iteratorContext.getSource === 'function'
      ? iteratorContext.getSource(source)
      : source;

  return (
    <ImageUploadField
      source={resolvedSource}
      label={label}
      onRemove={iteratorContext.remove}
    />
  );
};

export default ImageUrlIteratorItem;
