import { scheme } from './scheme';

export const en = scheme.defineLocale.strict({
  translations: {
    // why: {
    //   title: 'Why catcher?',
    //   content: () => (
    //     <>
    //       Exceptions occur in applications all the time. There are also times
    //       when it is necessary to intentionally throw exceptions.
    //       <br />
    //       Either way, these exceptions need to be handled at some final layer,
    //       and I would like to see, on a per-package or per-application basis, a
    //       consistent schema where the parameters of this exception are
    //       abstracted and referenced both when handling the exception and when
    //       throwing the exception.
    //       <br />
    //       catcher is a builder of exception classes dedicated to your
    //       application to meet this need in your application or package
    //       development.
    //     </>
    //   ),
    // },
    // assumedPhilosophy: {
    //   title: 'Assumed Philosophy',
    //   content: () => (
    //     <>
    //       catcher basically assumes the following philosophy. Of course, there
    //       is no problem to use it without assuming the following.
    //       <ul>
    //         <li>
    //           Handle any exceptions that occur together at a layer as close to
    //           the call of the process as possible
    //         </li>
    //         <li>
    //           The service logic at the end of the line, etc., either supplements
    //           the exception as little as possible, or supplements it, creates
    //           the necessary exception instance, and throws it to the caller.
    //         </li>
    //         <li>
    //           Have rules for exception handling and schemes during constructs by
    //           abstracting the exception situation according to the requirements
    //           and nature of the application.
    //           <ul>
    //             <li>Requested resource not found.</li>
    //             <li>No response was received from the opposing system.</li>
    //             <li>There was no authorization for the requested resource.</li>
    //           </ul>
    //         </li>
    //       </ul>
    //     </>
    //   ),
    // },
    // flowOfUsage: {
    //   title: 'Basic usage flow',
    //   example: 'e.g.',
    // },
    // step1: {
    //   title: 'Designing Exceptions in Your Application',
    //   content: () => (
    //     <>
    //       <ul>
    //         <li>
    //           All exceptions have a numerical status that follows the HTTP
    //           status code, and the status alone can be used to roughly
    //           distinguish the status of the exception.
    //         </li>
    //         <li>
    //           Since axios is mainly used in the application, the message and
    //           status are motivated when constructs are based on the axios error
    //           class
    //         </li>
    //       </ul>
    //     </>
    //   ),
    // },
    // step2: {
    //   title: 'Define exception classes according to design',
    // },
    // step3: {
    //   title: 'Use custom exceptions you define',
    // },
  },
});

export default en;
