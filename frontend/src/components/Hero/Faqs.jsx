import React from "react";
import { faqs } from "../../lib/constants";
import classNames from "classnames";
import { Accordion } from "radix-ui";
import { ChevronDown } from "lucide-react";

const Faqs = () => {
  const AccordionItem = React.forwardRef(
    ({ children, className, ...props }, forwardedRef) => (
      <Accordion.Item
        className={classNames(
          "mt-px overflow-hidden first:mt-0 border-b border-red-400  first:rounded-t last:rounded-b focus-within:relative focus-within:z-10 focus-within:shadow-[0_0_0_2px] focus-within:shadow-black/50 font-cormorant",
          className
        )}
        {...props}
        ref={forwardedRef}
      >
        {children}
      </Accordion.Item>
    )
  );

  const AccordionTrigger = React.forwardRef(
    ({ children, className, ...props }, forwardedRef) => (
      <Accordion.Header className='flex'>
        <Accordion.Trigger
          className={classNames(
            "group flex h-[45px] flex-1 cursor-default w-full items-center justify-between bg-black/90 px-2 leading-none text-white font-light shadow-[0_1px_0] text-left focus-within:underline shadow-black/60 outline-none hover:bg-black/20 font-cormorant",
            className
          )}
          {...props}
          ref={forwardedRef}
        >
          {children}
          <ChevronDown
            className='text-white transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180'
            aria-hidden
            size={18}
          />
        </Accordion.Trigger>
      </Accordion.Header>
    )
  );

  const AccordionContent = React.forwardRef(
    ({ children, className, ...props }, forwardedRef) => (
      <Accordion.Content
        className={classNames(
          "overflow-hidden bg-black/20  text-white data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown",
          className
        )}
        {...props}
        ref={forwardedRef}
      >
        <div className='px-5 py-[15px]'>{children}</div>
      </Accordion.Content>
    )
  );
    return (
      <div className="mx-auto text-white w-full py-10 ">
            <h2 className="font-cinzel text-center py-5 text-red-400">
                FREQUENTLY ASKED QUESTIONS
            </h2>
    <Accordion.Root
      className='w-full px-4 rounded-md bg-black/60 shadow-[0_2px_10px] shadow-black/5'
      type='single'
      collapsible
    >
      {faqs.map((faq, index) => (
        <AccordionItem value={`item-${index + 1}`} key={index}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion.Root>
      </div>
  );
};

export default Faqs;
