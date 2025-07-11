declare module '*.ttf?url' {
	const src: string;
	export default src;
}

declare module '*.csv?url' {
	const url: string;
	export default url;
}
