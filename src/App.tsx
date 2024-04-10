import { useEffect, useState } from "react";
import * as Dropdown from "./components/Dropdown";

export default function App() {
    const [users, setUsers] = useState<any>([]);
    const [selected, setSelected] = useState("");

    useEffect(() => {
        fetch("https://fakestoreapi.com/users")
            .then((res) => res.json())
            .then((data) => setUsers(data));
    }, []);

    return (
        <div className="max-w-prose mx-auto m-6" style={{ height: "1000px" }}>
            <Dropdown.Root placement="bottom-start">
                <Dropdown.Trigger className="px-4 py-1.5 rounded-md border border-gray-300 mx-auto capitalize">
                    {selected || "Select user"}
                </Dropdown.Trigger>
                <Dropdown.Content className="flex flex-col gap-2 border border-gray-300 p-1 rounded shadow-md max-h-96 overflow-y-auto w-56 animate-fade">
                    {users.map(({ name }: any) => {
                        const fullName = `${name.firstname} ${name.lastname}`;
                        return (
                            <Dropdown.Item
                                onClick={() => setSelected(fullName)}
                                className="py-2 px-5 hover:bg-gray-200 rounded text-left capitalize"
                                key={fullName}
                            >
                                {fullName}
                            </Dropdown.Item>
                        );
                    })}
                </Dropdown.Content>
            </Dropdown.Root>
        </div>
    );
}
