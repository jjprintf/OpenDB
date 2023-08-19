import { Client } from '../index';

const code = async () =>
{
    const OpenDB = new Client({ Path: "../../" });// Important! do not put / at the end of the path
    OpenDB.SetDatabase("NasheBro");
    await OpenDB.CreatePointer<string>("Nashe");

    OpenDB.on("error", (error) => {
        console.error(error);
    });
};

code();
