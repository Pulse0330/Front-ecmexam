import { useEffect, useState } from "react";

interface Aimag {
	mAcode: string;
	mName: string;
	mid: number;
	sort: number;
	miid: string;
	mid1: number;
}

interface AimagResponse {
	RetResponse: {
		ResponseType: boolean;
		ResponseMessage?: string;
	};
	RetData?: Aimag[];
}

export function useAimag() {
	const [aimags, setAimags] = useState<Aimag[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchAimags = async () => {
			try {
				const response = await fetch("/api/sign/aimag", {
					// ← Энэ URL-г засах
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({}),
				});

				const data: AimagResponse = await response.json();

				if (data?.RetResponse?.ResponseType && data?.RetData) {
					setAimags(data.RetData);
				}
			} catch (error) {
				console.error("Failed to fetch aimags:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAimags();
	}, []);

	return { aimags, isLoading };
}
