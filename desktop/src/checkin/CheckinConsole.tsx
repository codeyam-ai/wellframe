// The Daily Check-in surface — desktop port. A morning/evening check-in form
// (CheckinForm) submits a Mood row that also lands on the Activity Timeline —
// the page's primary interaction. Below it, the trailing check-in history. Owns
// the selected part of day.
//
// This port keeps the form and history read paths working; the submit write
// path is deferred to a Tauri command (see CheckinForm), so the "Log check-in"
// button and the parent refresh are inert for now.

import { useState } from 'react';
import { Metabar } from '../dashboard/Metabar';
import { WF_NAV_LINKS } from '../dashboard/nav';
import { CheckinForm } from './CheckinForm';
import { CheckinRow } from './CheckinRow';
import { CheckinEmpty } from './CheckinEmpty';
import type { PartOfDay } from './checkin';
import type { CheckinData } from './models';

const noop = () => {};

export function CheckinConsole({
  checkins,
  dateLabel,
  defaultPartOfDay = 'morning',
}: CheckinData) {
  const [partOfDay, setPartOfDay] = useState<PartOfDay>(defaultPartOfDay);

  return (
    <div className="wf">
      <Metabar
        dateLabel={dateLabel}
        subject="Daily Check-in"
        navLinks={WF_NAV_LINKS}
      />

      <div className="wf-ci-wrap">
        <div className="wf-secnum">
          <span className="n">01 /</span> Check-in ·{' '}
          {partOfDay === 'morning' ? 'Morning' : 'Evening'}
        </div>

        <CheckinForm
          partOfDay={partOfDay}
          onPartOfDay={setPartOfDay}
          onLogged={noop}
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
