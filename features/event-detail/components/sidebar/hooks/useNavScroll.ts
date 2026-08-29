import { useEffect, useState } from 'react';
import type { Candidate } from '@/features/event-detail/types';
import { SECTION_IDS, candidateAnchorId } from '@/features/event-detail/lib/anchors';

const MAIN_NAV_IDS: string[] = [
  SECTION_IDS.eventInfo,
  SECTION_IDS.usersInfo,
  SECTION_IDS.responsesInfo,
  SECTION_IDS.extractResponses,
];
const HEADER_HEIGHT = 100;

export function useNavScroll(candidates: Candidate[] | undefined) {
  const [activeId, setActiveId] = useState(SECTION_IDS.eventInfo as string);

  useEffect(() => {
    const getSectionTop = (id: string) => {
      const el = document.getElementById(id);
      return el ? el.getBoundingClientRect().top + window.scrollY : null;
    };

    const handleScroll = () => {
      const isAtBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

      if (isAtBottom) {
        setActiveId(SECTION_IDS.extractResponses);
        return;
      }

      const scrollY = window.scrollY + HEADER_HEIGHT;

      const activeMain = MAIN_NAV_IDS.map((id) => {
        const top = getSectionTop(id);
        return top !== null ? { id, top } : null;
      })
        .filter((s): s is { id: string; top: number } => s !== null)
        .filter((s) => s.top <= scrollY)
        .at(-1);

      if (!activeMain) return;

      if (activeMain.id === SECTION_IDS.responsesInfo && candidates?.length) {
        const activeCandidate = candidates
          .map((c) => {
            const top = getSectionTop(candidateAnchorId(c.id));
            return top !== null ? { id: candidateAnchorId(c.id), top } : null;
          })
          .filter((s): s is { id: string; top: number } => s !== null)
          .filter((s) => s.top <= scrollY)
          .at(-1);

        if (activeCandidate) {
          setActiveId(activeCandidate.id);
          return;
        }
      }

      setActiveId(activeMain.id);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [candidates]);

  return { activeId };
}
