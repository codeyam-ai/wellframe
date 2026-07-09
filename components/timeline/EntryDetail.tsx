// The detail surface for a single timeline entry, composed from one per-kind
// detail component. Plinth discipline: numbered section, bracket labels,
// hairline rules, grayscale photo. The DetailData shape + per-kind rendering
// live in the sub-components; this file only frames and dispatches.

import Link from 'next/link';
import { Metabar } from '@/components/dashboard/Metabar';
import type { DetailData } from './timeline';
import { WorkoutDetail } from './WorkoutDetail';
import { MoodDetail } from './MoodDetail';
import { WeightDetail } from './WeightDetail';
import { BriefingDetail } from './BriefingDetail';

export type { DetailData };

export function EntryDetail({ data, timeStamp }: { data: DetailData; timeStamp: string }) {
  return (
    <div className="wf">
      <Metabar dateLabel={timeStamp} subject="Activity · Entry" />
      <div className="wf-tl-wrap">
        <div className="wf-tl-detailhead">
          <div className="wf-secnum">01 / Entry</div>
          <Link href="/timeline" className="wf-tl-back">
            ← Back to timeline
          </Link>
        </div>
        {data.kind === 'workout' && <WorkoutDetail w={data.row} />}
        {data.kind === 'mood' && <MoodDetail m={data.row} />}
        {data.kind === 'weight' && <WeightDetail w={data.row} />}
        {data.kind === 'briefing' && <BriefingDetail b={data.row} />}
      </div>
    </div>
  );
}

export default EntryDetail;
