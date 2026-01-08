import { useEffect, useState } from "react";

interface District {
	id: number;
	name: string;
	sort: number;
}

interface DistrictResponse {
	RetResponse: {
		ResponseType: boolean;
		ResponseMessage?: string;
	};
	RetData?: District[];
}

export function useDistrict(aimagId: string | undefined) {
	const [districts, setDistricts] = useState<District[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!aimagId) {
			setDistricts([]);
			return;
		}

		const fetchDistricts = async () => {
			setIsLoading(true);
			try {
				const response = await fetch("/api/sign/district", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ aimag_id: aimagId }),
				});

				const data: DistrictResponse = await response.json();

				if (data?.RetResponse?.ResponseType && data?.RetData) {
					setDistricts(data.RetData);
				}
			} catch (error) {
				console.error("Failed to fetch districts:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchDistricts();
	}, [aimagId]);

	return { districts, isLoading };
}
