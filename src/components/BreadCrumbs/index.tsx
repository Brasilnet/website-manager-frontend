import { useRouter } from "next/router";
import { Breadcrumb } from "react-bootstrap";
import pathDictionary from "src/config/pathDictionary";

export default function BreadCrumbs() {
    const { pathname } = useRouter();

    const pathNameList = pathname.split('/');
    delete pathNameList[0];

    return (
        <Breadcrumb>
            {
                pathname !== '/' && <Breadcrumb.Item href="/">{pathDictionary['']?.icon}{pathDictionary['']?.label}</Breadcrumb.Item>
            }
            {
                pathNameList.map((path:string) => {
                    return pathDictionary[path] ? <Breadcrumb.Item href={path} active>{pathDictionary[path]?.icon}{pathDictionary[path]?.label}</Breadcrumb.Item> : null
                })
            }
        </Breadcrumb>
    )
};
