"""
Install ui via setuptools
"""
from setuptools import setup, find_packages

setup(
    name='micromasters',
    version='0.0.0',
    license='BSD',
    author='MIT ODL Engineering',
    author_email='odl-engineering@mit.edu',
    url='http://github.com/mitodl/micromasters',
    description="Web Portal for MicroMasters",
    packages=find_packages(),
    classifiers=[
        'Development Status :: 2 - Pre-Alpha',
        'Intended Audience :: Developers',
        'Intended Audience :: Education',
        'Programming Language :: Python',
    ],
    include_package_data=True,
    zip_safe=False,
)
