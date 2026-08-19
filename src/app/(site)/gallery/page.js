import { PageHeader } from '@/components/layout/PageHeader';
import { GalleryBoard } from './GalleryBoard';

export const metadata = {
  title: 'Gallery',
  description: 'Photos from department events, celebrations, team activities, awards and competitions.',
};

/** `/gallery` - photo gallery with category and event filtering. */
export default function GalleryPage() {
  return (
    <>
      <PageHeader
        title="Gallery"
        lead="Events, celebrations, away days and the moments in between."
        breadcrumbs={[{ label: 'Gallery' }]}
      />
      <GalleryBoard />
    </>
  );
}
