import { Platform } from '@/types/platform';
import { useEditor } from '@/contexts/EditorContext';

export const usePlatformSelector = () => {
  const { article, setPlatforms } = useEditor();
  const selectedPlatforms = article.meta.platforms;

  const togglePlatform = (id: Platform) => {
    if (selectedPlatforms.includes(id)) {
      setPlatforms(selectedPlatforms.filter((p) => p !== id));
    } else {
      setPlatforms([...selectedPlatforms, id]);
    }
  };

  return {
    selectedPlatforms,
    togglePlatform,
  };
};
