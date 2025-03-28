
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SizeGuidePage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Size Guide</h1>
            <p className="text-muted-foreground mb-8">
              Find the perfect fit for your handcrafted items with our detailed size guide
            </p>
            
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="general">General Sizes</TabsTrigger>
                <TabsTrigger value="bracelets">Bracelets</TabsTrigger>
                <TabsTrigger value="rings">Rings</TabsTrigger>
                <TabsTrigger value="necklaces">Necklaces</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general">
                <div className="prose max-w-none mb-6">
                  <h2>How to Measure</h2>
                  <p>
                    Finding the right size is essential for comfort and satisfaction with your purchase. 
                    Use a flexible measuring tape and follow our guidelines for each type of product.
                  </p>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead>US</TableHead>
                      <TableHead>EU</TableHead>
                      <TableHead>UK</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>XS</TableCell>
                      <TableCell>0-2</TableCell>
                      <TableCell>32-34</TableCell>
                      <TableCell>4-6</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>S</TableCell>
                      <TableCell>4-6</TableCell>
                      <TableCell>36-38</TableCell>
                      <TableCell>8-10</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>M</TableCell>
                      <TableCell>8-10</TableCell>
                      <TableCell>40-42</TableCell>
                      <TableCell>12-14</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>L</TableCell>
                      <TableCell>12-14</TableCell>
                      <TableCell>44-46</TableCell>
                      <TableCell>16-18</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>XL</TableCell>
                      <TableCell>16-18</TableCell>
                      <TableCell>48-50</TableCell>
                      <TableCell>20-22</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="bracelets">
                <div className="prose max-w-none mb-6">
                  <h2>Bracelet Sizing</h2>
                  <p>
                    To find your bracelet size, measure your wrist circumference just below the wrist bone. 
                    For a comfortable fit, add 0.5-1 inch (1.3-2.5 cm) to your wrist measurement.
                  </p>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead>Wrist Circumference (inches)</TableHead>
                      <TableHead>Wrist Circumference (cm)</TableHead>
                      <TableHead>Bracelet Length (inches)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>XS</TableCell>
                      <TableCell>5.5-6.0</TableCell>
                      <TableCell>14.0-15.2</TableCell>
                      <TableCell>6.5-7.0</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>S</TableCell>
                      <TableCell>6.0-6.5</TableCell>
                      <TableCell>15.2-16.5</TableCell>
                      <TableCell>7.0-7.5</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>M</TableCell>
                      <TableCell>6.5-7.0</TableCell>
                      <TableCell>16.5-17.8</TableCell>
                      <TableCell>7.5-8.0</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>L</TableCell>
                      <TableCell>7.0-7.5</TableCell>
                      <TableCell>17.8-19.1</TableCell>
                      <TableCell>8.0-8.5</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>XL</TableCell>
                      <TableCell>7.5-8.0</TableCell>
                      <TableCell>19.1-20.3</TableCell>
                      <TableCell>8.5-9.0</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="rings">
                <div className="prose max-w-none mb-6">
                  <h2>Ring Sizing</h2>
                  <p>
                    To find your ring size, measure the inside diameter of a ring that fits you well, 
                    or the circumference of your finger. The most accurate method is to visit a jeweler 
                    for professional sizing.
                  </p>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size (US)</TableHead>
                      <TableHead>Size (UK)</TableHead>
                      <TableHead>Inside Diameter (mm)</TableHead>
                      <TableHead>Inside Circumference (mm)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>4</TableCell>
                      <TableCell>H</TableCell>
                      <TableCell>14.8</TableCell>
                      <TableCell>46.5</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>5</TableCell>
                      <TableCell>J 1/2</TableCell>
                      <TableCell>15.7</TableCell>
                      <TableCell>49.3</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>6</TableCell>
                      <TableCell>L 1/2</TableCell>
                      <TableCell>16.5</TableCell>
                      <TableCell>51.8</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>7</TableCell>
                      <TableCell>N 1/2</TableCell>
                      <TableCell>17.3</TableCell>
                      <TableCell>54.4</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>8</TableCell>
                      <TableCell>P 1/2</TableCell>
                      <TableCell>18.2</TableCell>
                      <TableCell>57.1</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>9</TableCell>
                      <TableCell>R 1/2</TableCell>
                      <TableCell>19.0</TableCell>
                      <TableCell>59.7</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>10</TableCell>
                      <TableCell>T 1/2</TableCell>
                      <TableCell>19.8</TableCell>
                      <TableCell>62.3</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="necklaces">
                <div className="prose max-w-none mb-6">
                  <h2>Necklace Sizing</h2>
                  <p>
                    Necklace length is typically measured from end to end, including the clasp. 
                    The right length depends on your neck size and where you want the necklace to sit.
                  </p>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Length (inches)</TableHead>
                      <TableHead>Length (cm)</TableHead>
                      <TableHead>Sits At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Choker</TableCell>
                      <TableCell>14-16</TableCell>
                      <TableCell>35-40</TableCell>
                      <TableCell>Tightly around the neck</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Princess</TableCell>
                      <TableCell>18</TableCell>
                      <TableCell>45</TableCell>
                      <TableCell>On the collarbone</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Matinee</TableCell>
                      <TableCell>20-24</TableCell>
                      <TableCell>50-60</TableCell>
                      <TableCell>Between the collarbone and bust</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Opera</TableCell>
                      <TableCell>28-36</TableCell>
                      <TableCell>70-90</TableCell>
                      <TableCell>On or below the bust</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Rope</TableCell>
                      <TableCell>36+</TableCell>
                      <TableCell>90+</TableCell>
                      <TableCell>Below the bust</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
            
            <div className="mt-12 bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h2 className="text-xl font-bold mb-3">Sizing Tips</h2>
              <ul className="space-y-2 text-sm">
                <li>Measure multiple times for accuracy</li>
                <li>Measure at the end of the day when your fingers or wrists might be larger</li>
                <li>Consider seasonal changes - fingers and wrists can be smaller in cold weather</li>
                <li>For gifts, it's better to choose a slightly larger size that can be adjusted if needed</li>
                <li>If between sizes, go up rather than down for comfort</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SizeGuidePage;
