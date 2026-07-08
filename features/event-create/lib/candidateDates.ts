import { type DateRange } from 'react-day-picker';

/**
 * 選択範囲を1日刻みで展開し、既存の候補日と重複する日付を除外する
 */
export const buildNewCandidateDates = (range: DateRange, existing: Date[]): Date[] => {
	if (!range.from || !range.to) return [];

	const datesList: Date[] = [];
	const current = new Date(range.from);
	const end = new Date(range.to);

	while (current <= end) {
		datesList.push(new Date(current));
		current.setDate(current.getDate() + 1);
	}

	const existingDateStrings = new Set(existing.map((date) => date.toDateString()));

	return datesList.filter((date) => !existingDateStrings.has(date.toDateString()));
};
