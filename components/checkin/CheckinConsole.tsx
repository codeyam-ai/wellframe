// The Daily Check-in surface. A morning/evening check-in form (CheckinForm)
// submits a Mood row that also lands on the Activity Timeline — the page's
// primary interaction. Below it, the trailing check-in history. Client
// component: owns the selected part of day and refreshes the history after a
// check-in is logged.
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Metabar } from '@/components/dashboard/Metabar';
import { WF_NAV_LINKS } from '@/components/dashboard/nav';
import { CheckinForm } from './CheckinForm';
import { CheckinRow } from './CheckinRow';
import { CheckinEmpty } from './CheckinEmpty';
import type { PartOfDay } from './checkin';
import type { Mood } from '@prisma/client';

export function CheckinConsole({
  checkins,
  dateLabel,
  defaultPartOfDay = 'morning',
}: {
  checkins: Mood[];
  dateLabel: string;
  defaultPartOfDay?: PartOfDay;
}) {
  const router = useRouter();
  const [partOfDay, setPartOfDay] = useState<PartOfDay>(defaultPartOfDay);

  return (
    <div className="wf">
      <Metabar
        dateLabel={dateLabel}
        subject="Daily · Check-in"
        navLinks={WF_NAV_LINKS.filter((l) => l.href !== '/checkin')}
      />

      <div className="wf-ci-wrap">
        <div className="wf-secnum">
          <span className="n">01 /</span> Check-in ·{' '}
          {partOfDay === 'morning' ? 'Morning' : 'Evening'}
        </div>

        <CheckinForm
          partOfDay={partOfDay}
          onPartOfDay={setPartOfDay}
          onLogged={() => router.refresh()}
        />

        <div className="wf-secnum wf-ci-histhead">
          <span className="n">02 /</span> Recent Check-ins
        </div>
        {checkins.length > 0 ? (
          <div className="wf-ci-hist">
            {checkins.map((c) => (
              <CheckinRow key={c.id} checkin={c} />
            ))}
          </div>
        ) : (
          <CheckinEmpty />
        )}
      </div>
    </div>
  );
}

export default CheckinConsole;
