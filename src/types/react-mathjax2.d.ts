declare global {
	interface Window {
		MathJax?: {
			typesetPromise?: (elements?: Element[]) => Promise<void>;
			typesetClear?: (elements?: Element[]) => void;
			startup?: {
				promise?: Promise<void>;
				typeset?: boolean;
			};
			tex?: {
				inlineMath?: [string, string][];
				displayMath?: [string, string][];
				processEscapes?: boolean;
			};
			mml?: {
				parseNodes?: boolean;
			};
			options?: {
				skipHtmlTags?: string[];
				ignoreHtmlClass?: string;
				processHtmlClass?: string;
			};
			chtml?: {
				scale?: number;
				matchFontHeight?: boolean;
				mtextInheritFont?: boolean;
				merrorInheritFont?: boolean;
				displayAlign?: string;
				displayIndent?: string;
			};
			svg?: {
				scale?: number;
				matchFontHeight?: boolean;
				mtextInheritFont?: boolean;
				merrorInheritFont?: boolean;
				displayAlign?: string;
				displayIndent?: string;
			};
		};
	}
}

export {};
