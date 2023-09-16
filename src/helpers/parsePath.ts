export default function _parsePath(path: string): string 
{
	if (path.startsWith("/"))
		path = path.slice(1);
	if (path.endsWith("/"))
		path = path.slice(0, path.length - 1);
	if (path.startsWith("./") && !path.startsWith(".."))
		path = path.slice(2);
	
	return path;
}