export const Option: React.FC<{ label: string; onClick: () => void; selected: boolean }> = ({ label, onClick, selected }) => (
    <div
        onClick={onClick}
        className={`flex cursor-pointer items-center rounded-lg py-5 px-10 mt-3 border border-gray-400 shadow-sm transition duration-300 ease-in-out transform ${selected ? "bg-blue-500 text-white border-blue-500" : "bg-gray-300 text-gray-600 hover:-translate-y-0 hover:shadow-md"
            } dark:border-black-800 dark:bg-black-600 dark:text-white`}
    >
        {label} &nbsp;
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
        </svg>
    </div>
);
