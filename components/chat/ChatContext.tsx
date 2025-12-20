'use client';
import { useMutation } from "@tanstack/react-query";
import { createContext, useState } from "react";
import { toast } from "sonner";

type StreamResponse = {
    addMessage : ()=> void,
    message:string,
    handleInputChange : (event: React.ChangeEvent<HTMLTextAreaElement>)=> void,
    isLoading : boolean,

}


export const ChatContext = createContext<StreamResponse>({
    addMessage:()=> {},
    message:'',
    handleInputChange: ()=>{},
    isLoading : false,
})

interface Props{
    fileId: string;
    children: React.ReactNode;
}
export const ChatContextProvider = ({fileId, children}:Props)=>{
    const [message, setMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const {mutate: sendMessage,isPending} = useMutation({
        mutationFn : async({message}:{message:string})=>{
            const response = await fetch('/api/message',{
                method: 'POST',
                body: JSON.stringify({
                    fileId,
                    message
                }),
            })

            if(!response.ok){
                 throw new  Error('Failed to send message');
                }
            return response.body;
        },
        onSuccess:()=>{
            setMessage('');
            toast.info('Please wait for a while...');
        },
        onError:()=>{
            toast.error('Failed to send Message');
        }
    })
    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(event.target.value);
    };
    const addMessage = ()=> {
        sendMessage({message})
    };

    return (
        <ChatContext.Provider value={{
            addMessage,
            message,
            handleInputChange,
            isLoading:isPending
        }}>
            {children}
        </ChatContext.Provider>
    )

}