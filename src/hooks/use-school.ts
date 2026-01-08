import { useEffect, useState } from "react";

interface School {
	sName: string;
	conn: string;
	dbname: string;
	sort: number;
	district_id: number;
	serverip: string;
}

interface SchoolResponse {
	RetResponse: {
		ResponseType: boolean;
		ResponseMessage?: string;
	};
	RetData?: School[];
}

export function useSchool(
	aimagId: string | undefined,
	districtId: string | undefined,
) {
	const [schools, setSchools] = useState<School[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!aimagId || !districtId) {
			setSchools([]);
			return;
		}

		const fetchSchools = async () => {
			setIsLoading(true);
			try {
				const response = await fetch("/api/sign/school", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						aimag_id: Number(aimagId),
						district_id: Number(districtId),
					}),
				});

				const data: SchoolResponse = await response.json();

				if (data?.RetResponse?.ResponseType && data?.RetData) {
					setSchools(data.RetData);
				}
			} catch (error) {
				console.error("Failed to fetch schools:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSchools();
	}, [aimagId, districtId]);

	return { schools, isLoading };
}
