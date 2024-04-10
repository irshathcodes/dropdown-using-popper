import { Placement } from "@popperjs/core";
import React, {
    useState,
    useEffect,
    useRef,
    createContext,
    useContext,
} from "react";
import { usePopper } from "react-popper";
import { useClickAway } from "react-use";

type DropdownContextProps = {
    popperProps: ReturnType<typeof usePopper>;
    referenceElement: HTMLElement | null;
    setReferenceElement: React.Dispatch<
        React.SetStateAction<HTMLElement | null>
    >;
    popperElement: HTMLElement | null;
    setPopperElement: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
    initialOpen: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const DropdownContext = createContext({} as DropdownContextProps);

type DropdownRootProps = {
    initialOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    placement?: Placement;
};

export function DropdownRoot(
    props: React.PropsWithChildren<DropdownRootProps>
) {
    const {
        open: controlledOpen,
        onOpenChange: setControlledOpen,
        initialOpen = false,
    } = props;
    const [referenceElement, setReferenceElement] =
        React.useState<HTMLElement | null>(null);
    const [popperElement, setPopperElement] =
        React.useState<HTMLElement | null>(null);
    const popperProps = usePopper(referenceElement, popperElement, {
        modifiers: [
            {
                name: "offset",
                options: {
                    offset: [0, 8],
                },
            },
        ],
        placement: props.placement,
        strategy: "fixed",
    });

    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    useClickAway({ current: popperElement }, (e) => {
        const target = e.target as HTMLElement;
        if (
            (popperElement && popperElement.contains(target)) ||
            (referenceElement && referenceElement.contains(target))
        ) {
            return;
        }
        setOpen(false);
    });

    const value = React.useMemo(
        () => ({
            popperProps,
            referenceElement,
            setReferenceElement,
            popperElement,
            setPopperElement,
            initialOpen,
            open,
            onOpenChange: setOpen,
        }),
        [
            popperProps,
            referenceElement,
            setReferenceElement,
            popperElement,
            setPopperElement,
            initialOpen,
            open,
            setOpen,
        ]
    );

    return (
        <DropdownContext.Provider value={value}>
            {props.children}
        </DropdownContext.Provider>
    );
}

function useDropdownContext() {
    const context = useContext(DropdownContext);
    if (context == null) {
        throw new Error(
            "Dropdown components must be wrapped in <DropdownRoot />"
        );
    }
    return context;
}

export function DropdownTrigger({
    ...rest
}: React.ComponentPropsWithoutRef<"button">) {
    const { setReferenceElement, popperProps, onOpenChange, open } =
        useDropdownContext();

    return (
        <button
            ref={setReferenceElement}
            onMouseDown={() => {
                onOpenChange(!open);
            }}
            {...rest}
        />
    );
}

export function DropdownContent(
    props: React.PropsWithChildren<{
        className?: string;
        styles?: React.CSSProperties;
    }>
) {
    const { setPopperElement, popperProps, open } = useDropdownContext();
    const { styles, attributes } = popperProps;
    if (!open) return null;
    return (
        <div
            ref={setPopperElement}
            style={{ ...styles.popper, ...(props.styles || {}) }}
            {...attributes.popper}
            className={props.className}
        >
            {props.children}
        </div>
    );
}

export function DropdownItem({
    onClick,
    ...rest
}: React.ComponentPropsWithoutRef<"button">) {
    const { open, onOpenChange } = useDropdownContext();
    return (
        <button
            role="option"
            onClick={(e) => {
                onOpenChange(!open);
                onClick?.(e);
            }}
            {...rest}
        />
    );
}

const Content = DropdownContent;
const Trigger = DropdownTrigger;
const Root = DropdownRoot;
const Item = DropdownItem;

export { Content, Trigger, Root, Item };
