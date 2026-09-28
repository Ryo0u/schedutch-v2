import type { Metadata } from 'next';
import { EventContainer, getEventTitle } from '@/features/event-detail';

/** URL 転送先でイベント内容が見えないよう、コメント本文は載せず固定文にする */
const OG_DESCRIPTION = 'schedutch で日程を調整しています';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const title = await getEventTitle(id);
    // 存在しないイベントは layout.tsx の既定メタデータにフォールバックする
    if (!title) return {};
    return {
      title: `${title} | schedutch`,
      description: OG_DESCRIPTION,
      openGraph: { title, description: OG_DESCRIPTION, siteName: 'schedutch', type: 'website' },
    };
  } catch (error) {
    // 取得失敗でページ描画を止めない（本体は EventContainer が CSR で取得・エラー表示する）
    console.error(error);
    return {};
  }
}

export default async function Event({ params }: Props) {
  const eventId = (await params).id;
  return <EventContainer eventId={eventId} />;
}
