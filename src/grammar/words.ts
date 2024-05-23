export type Model = {
	file: string;
	width: number;
	height: number;
	color: string;
}

export const WORDS = {

	'Wall': {
		file: '/assets/test_wall.glb',
		width: 3.5,
		height: 3.5,
		color: '#905d5d',
	},

	'Window': {
		file: '/assets/test_window.glb',
		width: 3.5,
		height: 3.5,
		color: '#fda026',
	},

	'Small': {
		file: '/assets/test_window_150.glb',
		width: 1.5,
		height: 3.5,
		color: '#fda026',
	},

	'Door': {
		file: '/assets/test_shop.glb',
		width: 3.5,
		height: 3.5,
		color: '#905d5d',
	},

	'Panoramic': {
		file: '/assets/test_panel.glb',
		width: 3.5,
		height: 3.5,
		color: '#ff8c69',
	},

} satisfies { [word: string]: Model };

export type Word = Extract<keyof typeof WORDS, string>;
