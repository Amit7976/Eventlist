import LoginForm from '@/components/auth/loginForm'
import Image from 'next/image'


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const MainContent = async () => {

    return (
        <div className='min-h-screen flex flex-col justify-center items-center py-10'>
            <section className='pt-16 px-5'>
                <div className='w-full max-w-xl mx-auto'>
                    <h2 className='text-6xl font-medium text-center leading-[65px] font-serif'>
                        <span className="relative p-4 py-8">
                            <span className='relative z-10'>Login</span>
                            <Image
                                src={'/images/Random/hand_circle.svg'}
                                alt='Hand Circle'
                                width={800}
                                height={800}
                                className='absolute top-0 left-0 w-full h-full object-cover p-9 overflow-visible z-0'
                            />
                        </span>
                        <span className='pl-1'>to your <br /> Admin Panel</span>
                    </h2>
                </div>
            </section>

            <section className='w-full gap-6 my-5 p-5 pb-0 max-w-7xl mx-auto'>
                <LoginForm />
            </section >
            <div className="w-full max-w-3xl mx-auto my-5">
                <p className='text-sm text-center font-medium text-gray-400'>Admin Panel is secure by Administrator Control</p>
            </div>

        </div>
    )
}

export default MainContent