import fs from 'fs';
import path from 'path';

export default function _parseSrc(): string
{
	if(fs.existsSync( path.join(process.cwd(), 'src') )) 
	{
		return path.join(process.cwd(), 'src');
	} 
	else if (fs.existsSync( path.join(process.cwd(), '..', 'src') )) 
	{
		return path.join(process.cwd(), '..', 'src');
	}
	else if (fs.existsSync( path.join(process.cwd(), '..', '..', 'src') )) 
	{
		return path.join(process.cwd(), '..', '..', 'src');
	}
	else 
	{
		return path.join(process.cwd());
	}
}