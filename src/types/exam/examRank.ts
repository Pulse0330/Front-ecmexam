// /types/leaderboard.ts

export interface LeaderboardItem {
	medal: string;
	ranks: number;
	fname: string;
	point: number;
	core: number;
	sch_name: string | null;
	img_av: string;
	userid: number;
}

export interface LeaderboardResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: LeaderboardItem[];
}
